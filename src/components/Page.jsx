import Navbar from "./Navbar";

const Page = ({ children }) => {
  return (
    <main className="bg-white dark:bg-gray-dark min-h-screen">
      <Navbar />
      <div className={"p-4"}>{children}</div>
    </main>
  );
};

export default Page;
