function Home() {
    return (
        <div className="grid h-screen grid-cols-1 xl:grid-cols-2">
            <div className="mt-24 text-center text-white xl:my-auto">
                <h1 className="mb-6 text-5xl font-bold">
                    Welcome to <br />
                    TicTacToegether!
                </h1>
                <h4 className="mb-12 text-2xl">Join now to play and connect with friends.</h4>
                <div className="flex justify-center gap-14">
                    <button className="rounded border px-3 py-2">Sign Up</button>
                    <button className="rounded border px-3 py-2">Get Started</button>
                </div>
            </div>
            <div className="m-4 flex items-center">
                <div className="mx-auto my-16 grid aspect-square max-h-[700px] w-full max-w-[700px] grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border-b-4 border-gray-900 bg-gray-700 p-6">
                            {Math.random() > 0.5 ? (
                                <div className="aspect-square h-full w-full rounded-full border-[1rem] border-white"></div>
                            ) : (
                                <div className="relative flex aspect-square h-full w-full items-center justify-center">
                                    <div className="absolute h-4 w-full rotate-[45deg] rounded-l-full rounded-r-full bg-white"></div>
                                    <div className="absolute h-full w-4 rotate-[45deg] rounded-l-full rounded-r-full bg-white"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
