import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import DinoGame from 'react-chrome-dino-ts';
import 'react-chrome-dino-ts/index.css';

const ErrorPage = () => {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div className="flex min-h-screen w-full select-none items-center justify-center text-text">
                <div className="relative">
                    <div className="flex flex-col items-center space-y-1 text-center">
                        <img className="w-56 sm:hidden  " src="/error_figure.png" alt="" />
                        <h1 className="text-7xl font-black text-primary-400  ">OOOPS!</h1>
                        <p className="font-extrabold text-gray-500">
                            Sorry, an unexpected error has occurred.
                        </p>
                        <p className="font-extrabold text-gray-500">
                            Error: {error.status} {error.statusText}
                        </p>
                        <DinoGame />
                    </div>

                    <img
                        className="absolute -top-2 right-[-10em] hidden w-36 sm:block "
                        src="/error_figure.png"
                        alt=""
                    />
                </div>
            </div>
        );
    }
}

export default ErrorPage;