export default (data: any, numOfTokens: number) => {
  const sorted = data.Contents.sort((a: any, b: any) => {
    return (
      parseInt(a.Key.replaceAll('.json', '')) -
      parseInt(b.Key.replaceAll('.json', ''))
    );
  });
  const tokensList = sorted.map(({ Key }) =>
    parseInt(Key.replace('.json', '')),
  );
  const remainingTokens = [];
  for (var i = 1; i <= numOfTokens; i++) {
    if (tokensList.indexOf(i) == -1) {
      remainingTokens.push(i);
    }
  }
  return remainingTokens;
};
