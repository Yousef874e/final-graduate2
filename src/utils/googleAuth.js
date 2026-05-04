let isInitialized = false

export const initGoogleAuth = (callback) => {
  const load = () => {
    if (!window.google) return

    if (!isInitialized) {
      window.google.accounts.id.initialize({
        client_id: "470189378307-c74it8k81hpbmjhm0mekifk7n0fdpfjq.apps.googleusercontent.com",
        callback,
      })
      isInitialized = true
    }
  }

  if (document.getElementById("google-script")) {
    load()
  } else {
    const script = document.createElement("script")
    script.id = "google-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = load
    document.body.appendChild(script)
  }
}

export const renderGoogleButton = (element) => {
  if (!window.google || !element) return

  window.google.accounts.id.renderButton(element, {
    theme: "outline",
    size: "large",
    width: 300,
  })
}

export const triggerGoogleLogin = () => {
  if (window.google) {
    window.google.accounts.id.prompt()
  }
}