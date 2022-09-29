import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../backendLibs/dbLib";
import { v4 as uuidv4 } from "uuid";
import { checkToken } from "../../../../backendLibs/checkToken";

export default function roomIdMessageRoute(req, res) {
  if (req.method === "GET") {
    //check token
    const check = checkToken(req);

    if (!check)
      return res.status(401).json({
        ok: false,
        message: "You Dont have permission to access this api",
      });

    //get roomId from url
    const roomId = req.query.roomId;
    const rooms = readChatRoomsDB();
    const foundRoom = rooms.findIndex((x) => x.roomId === roomId);

    //check if roomId exist
    if (foundRoom === -1)
      return res.status(404).json({ ok: false, message: "Invalid room id" });

    //find room and return
    const chatHistory = rooms[foundRoom].messages;

    return res.json({ ok: true, messages: chatHistory });

    //...
  } else if (req.method === "POST") {
    //check token
    const check = checkToken(req);

    if (!check)
      return res.status(401).json({
        ok: false,
        message: "You Dont have permission to access this api",
      });

    //get roomId from url
    const roomId = req.query.roomId;
    const rooms = readChatRoomsDB();
    const foundRoom = rooms.findIndex((x) => x.roomId === roomId);

    //check if roomId exist
    if (foundRoom === -1)
      return res.status(404).json({ ok: false, message: "Invalid room id" });

    //validate body
    if (typeof req.body.text !== "string" || req.body.text.length === 0)
      return res.status(400).json({ ok: false, message: "Invalid text input" });

    //create message
    const newMessage = {
      messageId: uuidv4(),
      text: req.body.text,
      username: check.username,
    };

    rooms[foundRoom].messages.push(newMessage);

    writeChatRoomsDB(rooms);

    return res.json({ ok: true, message: newMessage });
  }
}
