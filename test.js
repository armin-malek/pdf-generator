const fs = require("fs");

const list = fs.readFileSync("./json.txt").toString().split("\r\n");

let str = "";
const forbiiden = [
  `"setHash"`,
  `"action_id"`,
  `"action_video_ur"`,
  `"exercise_system_id"`,
  `"created_at"`,
  `"updated_at"`,
];
list.forEach((element) => {
  element = element.trim();

  let isforbiiden = false;
  console.log(element);
  forbiiden.map((f) => {
    if (element.startsWith(f)) {
      isforbiiden = true;
    }
  });
  if (!isforbiiden) {
    str += element + "\r\n";
  }
});

fs.writeFileSync("./out.json", str);
