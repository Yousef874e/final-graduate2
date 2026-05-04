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

  try {
    await connection.start()
    console.log("✅ SignalR connected")
  } catch (err) {
    console.error("❌ SignalR connection failed:", err)
  }

  connection.onreconnecting(() => {
    console.log("⚠️ reconnecting...")
  })

  connection.onreconnected(() => {
    console.log("✅ reconnected")
  })

  connection.onclose(() => {
    console.log("❌ connection closed")
  })

  return connection
}