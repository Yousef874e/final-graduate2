import * as signalR from "@microsoft/signalr"

let connection = null

export const startConnection = async () => {
  if (connection) return connection

  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://rafiqv1.runasp.net/hubs/chat", {
      accessTokenFactory: () => localStorage.getItem("accessToken")
    })
    .withAutomaticReconnect()
    .build()

  await connection.start()
  console.log("✅ SignalR connected")

  return connection
}