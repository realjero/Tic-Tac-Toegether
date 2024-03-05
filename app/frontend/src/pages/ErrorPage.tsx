import {isRouteErrorResponse, useRouteError} from 'react-router-dom';
import DinoGame from 'react-chrome-dino-ts';
import 'react-chrome-dino-ts/index.css';

export default function ErrorPage() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (<div className="flex min-h-screen w-full items-center justify-center text-text select-none">

            <div className="relative">
                <div className="flex flex-col space-y-1 text-center items-center">
                    <img
                        className="w-56 sm:hidden  "
                        src="/error_figure.png"
                        alt=""
                    />
                    <h1 className="text-7xl font-black text-primary-400  ">OOOPS!</h1>
                    <p className="font-extrabold text-gray-500">Sorry, an unexpected error has occurred.</p>
                    <p className="font-extrabold text-gray-500">
                        Error: {error.status} {error.statusText}
                    </p>
                    <DinoGame/>
                </div>

                <img
                    className="w-36 absolute right-[-10em] -top-2 hidden sm:block "
                    src="/error_figure.png"
                    alt=""
                />
            </div>

        </div>);
    }
}