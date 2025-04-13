export const registerUser = async (
  name: string,
  username: string,
  email: string,
  password: string,
  password_confirmation: string
) => {
  const res = await fetch(`http://127.0.0.1:8000/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      email,
      password,
      password_confirmation,
    }),
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`http://127.0.0.1:8000/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};
