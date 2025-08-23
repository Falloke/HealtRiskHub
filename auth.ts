// import NextAuth from "next-auth"
// import Credentials from "next-auth/providers/credentials"


// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       // You can specify which fields should be submitted, by adding keys to the `credentials` object.
//       // e.g. domain, username, password, 2FA token, etc.
//       credentials: {
//         email: {
//           type: "email",
//           label: "Email",
//           placeholder: "example@gmail.com",
//         },
//         password: {
//           type: "password",
//           label: "Password",
//           placeholder: "*****",
//         },
//       },

//       authorize: async (credentials) => {
//         const user = null

//         // logic to salt and hash password
//         // const pwHash = saltAndHashPassword(credentials.password)

//         // // logic to verify if the user exists
//         // user = await getUserFromDb(credentials.email, pwHash)

//         if (!user) {
//           // No user found, so this is their first attempt to login
//           // Optionally, this is also the place you could do a user registration
//           throw new Error("Invalid credentials.")
//         }

//         // return user object with their profile data
//         return user
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user, account }) {

//       if (account?.provider === "credentials" && user) {
//         token.id = user.id;
//         token.first_name = user.first_name;
//         token.last_name = user.last_name;
//         token.role = user.role;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.first_name = token.first_name;
//         session.user.last_name = token.last_name;
//         session.user.role = token.role;
//       }
//       return session;
//     },
//   },

//   secret: process.env.AUTH_SECRET,
// })