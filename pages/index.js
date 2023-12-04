import Head from "next/head";
import Link from "next/link";
import { useUser } from '@auth0/nextjs-auth0/client';
import { getSession } from "@auth0/nextjs-auth0";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const { isLoading: isUserLoading, error: userError, user: authenticatedUser } = useUser();

  if (isUserLoading) return <div>Loading user data...</div>;
  if (userError) return <div>{userError.message}</div>;

  return (
    <>
      <Head>
        <title data-testid="cypress-title">Smart Chatbot</title>
      </Head>

      <header className="bg-gradient-to-r from-purple-800 to-indigo-800 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faRocket} className="text-emerald-200 text-4xl mr-2" />
            <h1 className="text-2xl font-bold">Smart Chatbot</h1>
          </div>
          <nav className="flex items-center">
            {!authenticatedUser && (
              <>
                <Link href="/api/auth/login" className="mr-4 hover:text-gray-300">Login</Link>
                <Link href="/api/auth/signup" className="hover:text-gray-300">Signup</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto flex justify-center items-center min-h-screen p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to Smart Chatbot
          </h1>
          <p className="text-lg mb-6">
            Explore the capabilities of our intelligent chatbot that operates on a client/server architecture. Engage in conversations, save chat history, and enjoy a seamless experience.
          </p>
          {/* Include additional content as needed */}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res);
  if (!!session) {
    return {
      redirect: {
        destination: "/chat",
      },
    };
  }

  return {
    props: {},
  };
};
