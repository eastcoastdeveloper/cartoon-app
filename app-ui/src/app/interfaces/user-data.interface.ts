export class CaptionsInterface {
  caption?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  votes?: number;
  approved: boolean;
}

export class UserDataInterface {
  altText: string;
  captions: CaptionsInterface[];
  imageUrl: string;
  itemIndex: number;
  _id: string;
}
