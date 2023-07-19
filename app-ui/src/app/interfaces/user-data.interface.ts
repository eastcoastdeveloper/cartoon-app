export class CaptionsInterface {
  caption?: string;
  // votes?: number;
  creator: string;
  approved: boolean;
  id?: string;
  location: string;
  // captionIndex?: string;
  username: string;
}

export class UserDataInterface {
  altText: string;
  captions: CaptionsInterface[];
  imageUrl: string;
  itemIndex: number;
  _id: string;
}
