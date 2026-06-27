
 
const { exec } = require("child_process");
 
module.exports = {
  get data() {
    return new Date().toLocaleDateString("pt-PT");
  },
  get hora() {
    return new Date().toLocaleTimeString("pt-PT");
  },
  exec,
};