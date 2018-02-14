import sjcl from 'sjcl';

const { REACT_APP_SEPARATOR_WORD: SEPARATOR_WORD } = process.env;

export function generateFileContent(imageBlob, cicData, masterKey) {
  const encData = sjcl.encrypt(masterKey, btoa(JSON.stringify(cicData)));
  return btoa(`${imageBlob}${SEPARATOR_WORD}${btoa(encData)}`);
};

export function parseFileContent(content, masterKey) {
  const [imageBlob, encData] = atob(content).split(SEPARATOR_WORD);
  let cicData;

  if (encData) {
    try {
      cicData = JSON.parse(atob(sjcl.decrypt(masterKey, atob(encData))));
    } catch (err) {
      cicData = null;
    }
  } else {
    cicData = null;
  }
  
  return [imageBlob, cicData];
};

export function filteredCicData(haystack, needle) {
  if (needle === '') {
    return haystack;
  }

  const result = {};
  const regexp = new RegExp(needle, 'i');
  const includesNeedle = e => regexp.test(e);

  for (let category in haystack) {
    result[category] = haystack[category].filter(row => {
      return [...row.slice(0, 2), ...row.slice(3)].some(includesNeedle)
    });
    if (result[category].length === 0) {
      delete result[category];
    }
  }

  return result;
};
