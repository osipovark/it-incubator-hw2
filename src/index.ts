import { app } from "./app";

const port = 3003;

app.listen(port, () => {
  console.log(`The application is running on port: ${port}`);
});
