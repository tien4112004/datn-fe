function readPackage(pkg) {
  if (pkg.name === '@hookform/resolvers') {
    pkg.dependencies = {
      ...pkg.dependencies,
      zod: '^4.0.0',
    };
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
