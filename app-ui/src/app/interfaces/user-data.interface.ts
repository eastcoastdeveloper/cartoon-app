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
  images: string;
  captions: CaptionsInterface;
}
