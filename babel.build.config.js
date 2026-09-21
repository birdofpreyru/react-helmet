export default {
  plugins: [
    'babel-plugin-react-compiler',
    '@dr.pogodin/add-import-extension',
  ],
  presets: [
    '@babel/env',
    '@babel/react',
    '@babel/typescript',
  ],
  targets: 'maintained node versions',
};
