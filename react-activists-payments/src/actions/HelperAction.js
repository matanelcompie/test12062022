export function arrayToHash(arr, nameFieldKey) {
  var hash = [];
  arr.forEach((item) => {
    hash[item[nameFieldKey]] = item;
  });
  console.log(hash);
  return hash;
}

export function isFunction(functionToCheck) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === "[object Function]"
  );
}
