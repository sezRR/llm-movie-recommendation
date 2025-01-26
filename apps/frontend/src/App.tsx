function App() {
    return (
        // TODO: ADD SHADCN/UI, REACT ROUTER, TAILWINDCSS THEMES
        <div>
            <h1>Hello, World!</h1>
            <button
                className="flex items-center gap-6 text-lg border-2 border-primary-600 px-4 py-4 font-medium rounded-4xl hover:cursor-pointer"
                onClick={() => {
                    // Redirect to the backend with proxy URL
                    window.location.href = "http://localhost:3000/auth/google";
                }}
            >
                <img
                    src="https://authjs.dev/img/providers/google.svg"
                    alt="Google logo"
                    height="24"
                    width="24"
                />
                <span>Continue with Google</span>
            </button>
        </div>
    );
}

export default App;
