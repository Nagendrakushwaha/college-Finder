
export interface CollegeDetails {
  collegeName: string;
  state: string;
  district: string;
  universityAffiliation: string;
  collegeType: string;
  coursesOffered: string[];
  principalName: string;
  principalContact: string;
  principalEmail: string;
  tpoName: string;
  tpoContact: string;
  tpoEmail: string;
  officialWebsite: string;
  aisheCode: string;
  yearOfEstablishment: string;
  accreditationDetails: string;
  studentStrength: string;
  facultyStrength: string;
  address: string;
  pinCode: string;
  confidenceScore: number;
  sources: { title: string; uri: string }[];
}

export enum IndiaStates {
  ANDHRA_PRADESH = "Andhra Pradesh",
  ARUNACHAL_PRADESH = "Arunachal Pradesh",
  ASSAM = "Assam",
  BIHAR = "Bihar",
  CHHATTISGARH = "Chhattisgarh",
  GOA = "Goa",
  GUJARAT = "Gujarat",
  HARYANA = "Haryana",
  HIMACHAL_PRADESH = "Himachal Pradesh",
  JHARKHAND = "Jharkhand",
  KARNATAKA = "Karnataka",
  KERALA = "Kerala",
  MADHYA_PRADESH = "Madhya Pradesh",
  MAHARASHTRA = "Maharashtra",
  MANIPUR = "Manipur",
  MEGHALAYA = "Meghalaya",
  MIZORAM = "Mizoram",
  NAGALAND = "Nagaland",
  ODISHA = "Odisha",
  PUNJAB = "Punjab",
  RAJASTHAN = "Rajasthan",
  SIKKIM = "Sikkim",
  TAMIL_NADU = "Tamil Nadu",
  TELANGANA = "Telangana",
  TRIPURA = "Tripura",
  UTTAR_PRADESH = "Uttar Pradesh",
  UTTARAKHAND = "Uttarakhand",
  WEST_BENGAL = "West Bengal",
  DELHI = "Delhi"
}

export interface SearchItem {
  id: string;
  name: string;
  state: string;
  district: string;
}
