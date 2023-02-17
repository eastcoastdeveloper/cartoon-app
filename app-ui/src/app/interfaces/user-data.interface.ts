export class CaptionsInterface {
  caption?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  votes?: number;
}

export class UserDataInterface {
  altText: string;
  cached: boolean;
  captions: CaptionsInterface[];
  date: number;
  imageUrl: string;
  itemIndex: number;
  totalCaptions: number;
  _id: string;
}
