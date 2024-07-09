//promosify
const promisify = (fn : Function) => {
  return (...args : any) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err : any, result : any) => {
        if (err)
          reject(err);
        resolve(result);
      });
    });
  };
};

export default promisify;