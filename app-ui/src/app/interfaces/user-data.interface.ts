export class CaptionsInterface {
  caption?: string;
  votes?: number;
  approved: boolean;
  id?: string;
  captionIndex?: string;
  creator: string;
  username: string;
}

export class UserDataInterface {
  altText: string;
  captions: CaptionsInterface[];
  imageUrl: string;
  itemIndex: number;
  _id: string;
}
