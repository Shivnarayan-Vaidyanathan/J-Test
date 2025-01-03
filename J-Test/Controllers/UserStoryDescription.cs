using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.Annotations;  // Add Swagger namespace
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using System;
using J_Test.Models;

namespace J_Test.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserStoryDescriptionController : ControllerBase
    {
        private readonly ILogger<UserStoryDescriptionController> _logger;
        private static readonly HttpClient client = new HttpClient();

        // Gemini API Key (hardcoded)
        private const string GeminiApiKey = "AIzaSyDy8skxKpN76tUGmw_7CuiFo_aRiP5nj5s"; // Hardcoded Gemini API key

        public UserStoryDescriptionController(ILogger<UserStoryDescriptionController> logger)
        {
            _logger = logger;
        }

        // Endpoint to generate test cases from a user story (POST)
        [HttpPost("GenerateTestCases")]
        [SwaggerOperation(Summary = "Generate test cases from a user story", Description = "Generates test cases based on the provided user story.")]
        [SwaggerResponse(200, "Test cases generated successfully", typeof(string))]
        [SwaggerResponse(400, "Bad request, invalid user story format")]
        [SwaggerResponse(500, "Internal server error")]
        public async Task<IActionResult> GenerateTestCases([FromBody] UserStoryRequest request)
        {
            _logger.LogInformation($"Received user story: {request.UserStory}");  // Log the incoming user story.

            if (string.IsNullOrWhiteSpace(request.UserStory))
            {
                _logger.LogWarning("User story is empty.");
                return BadRequest("User story cannot be empty.");
            }

            if (!IsValidUserStory(request.UserStory))
            {
                _logger.LogWarning($"Invalid user story format: {request.UserStory}");
                return BadRequest($"Invalid user story format: {request.UserStory}");
            }

            // Call the method to generate test cases using the Gemini API
            var response = await GenerateTestCasesFromGemini(request.UserStory);

            if (string.IsNullOrEmpty(response))
            {
                _logger.LogError("Failed to generate test cases.");
                return StatusCode(500, "Failed to generate test cases.");
            }

            return Ok(response); // Return the generated test cases as a response
        }

        // Validate the user story format
        private bool IsValidUserStory(string userStory)
        {
            // A simple check for a valid user story structure
            return userStory.StartsWith("As a", StringComparison.OrdinalIgnoreCase) || userStory.Contains("I want to", StringComparison.OrdinalIgnoreCase) || userStory.Contains("I want an", StringComparison.OrdinalIgnoreCase) || userStory.Contains("so that", StringComparison.OrdinalIgnoreCase) || userStory.Contains("The user", StringComparison.OrdinalIgnoreCase) || userStory.Contains("I want a", StringComparison.OrdinalIgnoreCase);
        }

        // Generate test cases using the Gemini API
        private async Task<string> GenerateTestCasesFromGemini(string userStory)
        {
            try
            {
                // Define the Gemini API URL using the hardcoded API key
                string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GeminiApiKey}";

                // Create the payload to send to Gemini
                var jsonPayload = $"{{\"contents\": [{{\"parts\": [{{\"text\": \"Generate functional test cases for the following user story, including both pass and fail scenarios, and display them in a table format with columns for test case description, expected result, and actual result: {userStory}\"}}]}}]}}";

                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                var apiResponse = await client.PostAsync(apiUrl, content);

                if (!apiResponse.IsSuccessStatusCode)
                {
                    _logger.LogError($"API request failed with status code: {apiResponse.StatusCode}");
                    return null;
                }

                var responseContent = await apiResponse.Content.ReadAsStringAsync();

                return responseContent; // Return the response (the generated test cases)
            }
            catch (Exception ex)
            {
                _logger.LogError($"Exception occurred while generating test cases with Gemini: {ex.Message}");
                return null;
            }
        }

        [HttpGet("ExportAllUserStories")]
        [SwaggerOperation(Summary = "Export all user stories from Jira", Description = "Fetches Jira issues based on domain, project, and issue type.")]
        [SwaggerResponse(200, "Successfully retrieved Jira issues", typeof(List<IssueDetail>))]
        [SwaggerResponse(400, "Bad request - missing domain, project, or issue type")]
        [SwaggerResponse(500, "Internal server error")]
        public async Task<IActionResult> ExportAllUserStories([FromQuery] JiraRequestParams request)
        {
            try
            {
                // Ensure the necessary parameters are provided
                if (string.IsNullOrEmpty(request.domain) || string.IsNullOrEmpty(request.project) || string.IsNullOrEmpty(request.issueType) ||
                    string.IsNullOrEmpty(request.username) || string.IsNullOrEmpty(request.apiToken))
                {
                    _logger.LogWarning("Domain, project, issue type, username, or apiToken is missing.");
                    return BadRequest("Please provide domain, project, issue type, username, and API token.");
                }

                // Use request parameters
                string authValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{request.username}:{request.apiToken}"));

                var jiraUrl = $"https://{request.domain}/rest/api/2/search?jql=project = {request.project} AND issuetype = {request.issueType} AND reporter = currentUser() AND summary IS NOT EMPTY";

                var requestMessage = new HttpRequestMessage(HttpMethod.Get, jiraUrl);
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);

                var apiResponse = await client.SendAsync(requestMessage);

                // Log the request URL and headers
                _logger.LogInformation($"Jira API Request: {jiraUrl}");
                _logger.LogInformation($"Authorization: Basic {authValue}");

                if (!apiResponse.IsSuccessStatusCode)
                {
                    var errorContent = await apiResponse.Content.ReadAsStringAsync();
                    _logger.LogError($"Jira API request failed with status code: {apiResponse.StatusCode}. Error: {errorContent}");
                    return StatusCode(500, "Failed to fetch Jira issues.");
                }

                var responseContent = await apiResponse.Content.ReadAsStringAsync();
                _logger.LogInformation($"Jira API Response: {responseContent}");

                var dictProjectIssues = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                var listAllIssues = new List<IssueDetail>();

                if (dictProjectIssues.ContainsKey("issues"))
                {
                    var issues = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(dictProjectIssues["issues"].ToString());

                    foreach (var issue in issues)
                    {
                        var issueDetail = new IssueDetail();
                        var fields = issue.ContainsKey("fields") ? JsonConvert.DeserializeObject<Dictionary<string, object>>(issue["fields"].ToString()) : null;
                        if (fields != null)
                        {
                            if (fields.ContainsKey("summary"))
                                issueDetail.Summary = fields["summary"].ToString();

                            if (fields.ContainsKey("description"))
                                issueDetail.Description = fields["description"]?.ToString() ?? "No description available";

                            if (fields.ContainsKey("reporter"))
                            {
                                var reporter = JsonConvert.DeserializeObject<Dictionary<string, object>>(fields["reporter"].ToString());
                                issueDetail.Reporter = reporter.ContainsKey("displayName") ? reporter["displayName"].ToString() : "Unknown";
                            }
                        }

                        listAllIssues.Add(issueDetail);
                    }
                }

                return Ok(listAllIssues);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching Jira data: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}