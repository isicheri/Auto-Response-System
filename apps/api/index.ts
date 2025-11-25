 function startApplication() {
    try {
    console.log("Application starting...");
    require("./app");
    console.log("Application started successfully");
} catch(err) {
    console.error("Application failed to start", err);
    process.exit(1);
}
}
startApplication();