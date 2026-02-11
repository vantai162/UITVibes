

var builder = DistributedApplication.CreateBuilder(args);

var cache = builder.AddRedis("cache");




// Add PostgreSQL for data persistence
var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    //.WithHostPort(5432)
    .WithDataVolume("postgres_data");
 

var authDb = postgres.AddDatabase("authdb");
//var userDb = postgres.AddDatabase("userdb");
//var postDb = postgres.AddDatabase("postdb");

// Add RabbitMQ for inter-service messaging
var messaging = builder.AddRabbitMQ("messaging");

var authService = builder.AddProject<Projects.AuthService>("authservice")
    .WithReference(authDb)
    .WaitFor(authDb)
    .WithReference(cache)
    .WithHttpHealthCheck("/health"); 

// User Service - manages user profiles and information
/*var userService = builder.AddProject<Projects.UserService>("userservice")
    .WithReference(userDb)
    .WithReference(cache)
    .WithReference(messaging)
    .WithHttpHealthCheck("/health");*/

// Post Service - handles post creation, updates, and retrieval
/*var postService = builder.AddProject<Projects.PostService>("postservice")
    .WithReference(postDb)
    .WithReference(cache)
    .WithReference(messaging)
    .WithHttpHealthCheck("/health");*/


// API Gateway - routes requests to appropriate services
var apiService = builder.AddProject<Projects.UITVibes_Microservices_ApiService>("apiservice")
    .WithHttpHealthCheck("/health")
    .WithReference(cache)
    .WithReference(authService);
    //.WithReference(userService)
    //.WithReference(postService);


builder.Build().Run();
