
const response = await fetch("http://localhost:5104/tags");
console.log(response);
console.log(await response.json());