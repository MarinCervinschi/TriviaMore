export interface UserClassResponse {
	userId: string;
	classId: string;
	createdAt: Date;
	updatedAt: Date;
	class: {
		id: string;
		name: string;
		code: string;
		description?: string;
		classYear: number;
		position: number;
		course: {
			id: string;
			name: string;
			code: string;
			courseType: "BACHELOR" | "MASTER";
			department: {
				id: string;
				name: string;
				code: string;
			};
		};
	};
}

export interface AddClassToUserListRequest {
	classId: string;
}

export interface RemoveClassFromUserListRequest {
	classId: string;
}

export interface UserSavedClassesResponse {
	savedClasses: UserClassResponse[];
}

export interface AddClassToUserListResponse {
	message: string;
	savedClass: UserClassResponse;
}

export interface RemoveClassFromUserListResponse {
	success: boolean;
	message: string;
}
