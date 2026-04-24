import Notification from "../models/NotificationModel.js";

export const notify = async(userId, message) => {
    await Notification.create({ user: userId, message});
}