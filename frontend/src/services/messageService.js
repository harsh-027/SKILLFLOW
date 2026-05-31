import API from "../api/axios";

export const sendMessage = async ({ receiverId, content }) => {
  const { data } = await API.post("/messages", { receiverId, content });
  return data;
};

export const getConversation = async (userId) => {
  const { data } = await API.get(`/messages/${userId}`);
  return data;
};
