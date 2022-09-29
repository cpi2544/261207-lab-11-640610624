import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  if (req.method === "DELETE") {
    //get ids from url
    const roomId = req.query.roomId;
    const messageId = req.query.messageId;

    //check token
    const check = checkToken(req);

    if (!check)
      return res.status(401).json({
        ok: false,
        message: "You Dont have permission to access this api",
      });

    const rooms = readChatRoomsDB();

    //check if roomId exist
    const foundRoom = rooms.findIndex((x) => x.roomId === roomId);
    if (foundRoom === -1)
      return res.status(404).json({ ok: false, message: "Invalid room id" });

    //check if messageId exist
    const chatHistory = rooms[foundRoom].messages;
    const foundMessageID = chatHistory.findIndex(
      (x) => x.messageId === messageId
    );
    if (foundMessageID === -1)
      return res.status(404).json({ ok: false, message: "Invalid message id" });

    if (check.isAdmin) {
      chatHistory.splice(foundMessageID, 1);
      rooms[foundRoom].messages = chatHistory;

      writeChatRoomsDB(rooms);

      return res.json({
        ok: true,
      });
    } else {
      if (
        rooms[foundRoom].messages[foundMessageID].username === check.username
      ) {
        chatHistory.splice(foundMessageID, 1);
        rooms[foundRoom].messages = chatHistory;

        writeChatRoomsDB(rooms);

        return res.json({
          ok: true,
        });
      }
    }

    //check if token owner is admin, they can delete any message
    //or if token owner is normal user, they can only delete their own message!
  }
}
