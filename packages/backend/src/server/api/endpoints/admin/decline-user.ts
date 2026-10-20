/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { UsedUsernamesRepository, UsersRepository, UserProfilesRepository } from '@/models/_.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';
import { DI } from '@/di-symbols.js';
import { EmailService } from '@/core/EmailService.js';
import { DeleteAccountService } from '@/core/DeleteAccountService.js';
import { trackPromise } from '@/misc/promise-tracker.js';
import { ApiError } from '@/server/api/error.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,
	kind: 'write:admin:decline-user',

	errors: {
		userProtected: {
			message: 'User is protected.',
			code: 'USER_PROTECTED',
			id: 'b5983a6a-9930-4c06-966b-d1cac0054544',
		},

		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: 'a89abd3d-f0bc-4cce-beb1-2f446f4f1e6a',
		},

		userNotLocal: {
			message: 'User is not local.',
			code: 'USER_NOT_LOCAL',
			id: '46b31d0a-1f46-4292-aa73-955f5a083897',
		},

		userIsSuspended: {
			message: 'User is suspended.',
			code: 'USER_IS_SUSPENDED',
			id: '07e7d267-8a14-49fe-a196-92e619bac99a',
		},

		userIsApproved: {
			message: 'User is already approved.',
			code: 'USER_IS_APPROVED',
			id: 'edfd58b3-d7af-4d5a-aab3-ed1a9dbc5172',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
	},
	required: ['userId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usedUsernamesRepository)
		private readonly usedUsernamesRepository: UsedUsernamesRepository,

		@Inject(DI.usersRepository)
		private readonly usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private readonly userProfilesRepository: UserProfilesRepository,

		private readonly moderationLogService: ModerationLogService,
		private readonly emailService: EmailService,
		private readonly deleteAccountService: DeleteAccountService,
	) {
		super(meta, paramDef, async (ps, me) => {
			// NOTE: upstream CacheService has no findOptionalUserById,
			// so the user is loaded directly from the repository.
			const user = await this.usersRepository.findOneBy({ id: ps.userId });
			const profile = await this.userProfilesRepository.findOneBy({ userId: ps.userId });

			if (user == null || user.isDeleted) throw new ApiError(meta.errors.noSuchUser);
			if (user.host != null) throw new ApiError(meta.errors.userNotLocal);
			if (user.isSuspended) throw new ApiError(meta.errors.userIsSuspended);
			if (user.approved) throw new ApiError(meta.errors.userIsApproved);

			if (profile?.email) {
				// TODO email should really be handled by a job so we can retry
				trackPromise(this.emailService.sendEmail(profile.email, 'Account Declined',
					'Your Account has been declined!',
					'Your Account has been declined!'));
			}

			// NOTE: upstream DeleteAccountService throws plain Errors (not
			// IdentifiableError), so root/system-account protection surfaces
			// as an unexpected error instead of USER_PROTECTED.
			await this.deleteAccountService.deleteAccount(user, me);

			await this.usedUsernamesRepository.delete({ username: user.username.toLowerCase() });

			await this.moderationLogService.log(me, 'decline', {
				userId: user.id,
				userUsername: user.username,
				userHost: user.host,
			});
		});
	}
}
