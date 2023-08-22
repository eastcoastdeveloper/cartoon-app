export class CaptionsInterface {
  caption?: string;
  creator: string;
  approved: boolean;
  id?: string;
  location: string;
  username: string;
}

export class UserDataInterface {
  altText: string;
  captions: CaptionsInterface[];
  imageUrl: string;
  itemIndex: number;
  _id: string;
}
