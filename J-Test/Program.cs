using Microsoft.EntityFrameworkCore;
using J_Test.Models;
using Microsoft.OpenApi.Models; // Ensure this namespace is included to access JTestCredentialsContext

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register IHttpClientFactory for use in controllers
builder.Services.AddHttpClient();

// Register DbContext with the connection string
builder.Services.AddDbContext<JTestCredentialsContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))); // Use your connection string here

// Register Swagger generator
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "User Story API",
        Version = "v1",
        Description = "An API for generating test cases from user stories"
    });

    // Optional: Add security definition if your API requires an API key in headers
    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "apiKey",
        Type = SecuritySchemeType.ApiKey,
        Description = "API key needed to access the endpoints"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new string[] { }
        }
    });
});

// Enable CORS for React App
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        // Allow the React app to make requests from localhost:3000
        policy.WithOrigins("http://localhost:3000")  // React app URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Enable CORS middleware before authorization
app.UseCors("AllowReactApp"); // Apply the CORS policy globally

app.UseAuthorization();

// Enable Swagger and Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "User Story API V1");
    options.RoutePrefix = string.Empty; // Set Swagger UI at root path
});

app.MapControllers(); // Map controllers for the API endpoints

app.Run();