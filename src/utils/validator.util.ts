export const emailValidator = (email: string) => {
  const re = /\S+@\S+\.\S+/; 
  return re.test(email);
};

export const passwordValidator = (password: string) => {
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/; // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
  return re.test(password);
};


export const nameValidator = (name: string) => {
  const re = /^[a-zA-Z]+$/; // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
  return re.test(name);
};

export const phoneValidator = (phone: string) => {
  const re = /^[0-9]{10}$/; // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
  return re.test(phone);
};
