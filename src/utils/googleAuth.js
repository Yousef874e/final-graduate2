import { GoogleLogin } from "@react-oauth/google";

export default function GoogleAuthButton() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log(credentialResponse);

        const token = credentialResponse.credential;

        console.log(token);
      }}
      onError={() => {
        console.log("Login Failed");
      }}
      useOneTap={false}
    />
  );
}