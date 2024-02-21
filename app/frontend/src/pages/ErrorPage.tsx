import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div className="flex h-screen w-screen items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-3xl">Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.statusText || error.message}</i>
                </p>
            </div>
        </div>
    );
}
