export type WelcomeCourse = {
  code: string;
  title: string;
};

export type WelcomeProgram = {
  code: string;
  name: string;
};

export type WelcomeData = {
  newMessageCount: number;
  semester: string;
  program: WelcomeProgram;
  courses: WelcomeCourse[];
  deinscriptionDate: string;
  abandonDate: string;
};
