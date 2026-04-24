export type BoarderRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
};

export type StayRow = {
  id: string;
  boarder_id: string;
  pet_name: string;
  owner_name: string | null;
  phone_number: string | null;
  pet_photo: string | null;
  note: string | null;
  meal_schedule: string | null;
  start_date: string;
  end_date: string | null;
  status: "active" | "completed";
  share_token: string;
  created_at: string;
};

export type UploadRow = {
  id: string;
  stay_id: string;
  type: "photo" | "video";
  file_url: string;
  thumbnail: string | null;
  caption: string | null;
  created_at: string;
};

export type PottyLogRow = {
  id: string;
  stay_id: string;
  event_type: "pee" | "poop";
  created_at: string;
};

export type MealLogRow = {
  id: string;
  stay_id: string;
  created_at: string;
};

export type StayWithBoarder = StayRow & {
  boarders: Pick<BoarderRow, "name" | "avatar_url">;
};
