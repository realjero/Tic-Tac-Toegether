function Home() {
    return (
        <div className="text-text grid h-screen grid-cols-1 xl:grid-cols-2">
            <div className="mt-24 text-center xl:my-auto">
                <h1 className="mb-6 text-5xl font-bold">
                    Welcome to <br />
                    <i className="from-primary to-accent bg-gradient-to-r bg-clip-text p-1 text-transparent">
                        TicTacToegether!
                    </i>
                </h1>
                <h4 className="mb-12 flex justify-center text-2xl">
                    Join now to <b className="mx-1 animate-pulse">play</b> and connect with{' '}
                    <b className="mx-1 animate-bounce">friends</b>.
                </h4>
                <div className="flex justify-center gap-14">
                    <button className="border-primary rounded border px-3 py-2">Sign Up</button>
                    <button className="border-accent rounded border px-3 py-2">Get Started</button>
                </div>
            </div>
            <div className="m-4 flex items-center">
                <div className="mx-auto my-16 grid aspect-square max-h-[700px] w-full max-w-[700px] grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-secondary rounded-xl p-6">
                            {Math.random() > 0.5 ? (
                                <div className="border-text aspect-square h-full w-full rounded-full border-[1rem]"></div>
                            ) : (
                                <div className="relative flex aspect-square h-full w-full items-center justify-center">
                                    <div className="bg-text absolute h-4 w-full rotate-[45deg] rounded-l-full rounded-r-full"></div>
                                    <div className="bg-text h-full w-4 rotate-[45deg] rounded-l-full rounded-r-full"></div>
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
