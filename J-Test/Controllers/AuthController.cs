using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using J_Test.Models;
using System.Threading.Tasks;

namespace J_Test.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JTestCredentialsContext _context;

        public AuthController(JTestCredentialsContext context)
        {
            _context = context;
        }

        // POST: api/auth/signup
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] Credential credential)
        {
            if (credential == null || string.IsNullOrWhiteSpace(credential.email) || string.IsNullOrWhiteSpace(credential.password))
            {
                return BadRequest("Invalid credentials.");
            }

            // Check if email already exists
            if (await _context.Credentials.AnyAsync(c => c.email == credential.email))
            {
                return BadRequest("Email is already taken.");
            }

            // Save the new credential to the database
            _context.Credentials.Add(credential);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User successfully created." });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Credential loginCredential)
        {
            if (loginCredential == null || string.IsNullOrWhiteSpace(loginCredential.email) || string.IsNullOrWhiteSpace(loginCredential.password))
            {
                return BadRequest("Invalid login credentials.");
            }

            // Look for user by email
            var user = await _context.Credentials
                .FirstOrDefaultAsync(c => c.email == loginCredential.email);

            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // Validate password (plain text comparison)
            if (loginCredential.password != user.password)
            {
                return Unauthorized("Invalid password.");
            }

            return Ok(new { message = "Login successful." });
        }

        // GET: api/settings/details
        [HttpGet("details")]
        public async Task<IActionResult> Getdetails()
        {
            // Retrieve all stored credentials from the database
            var details = await _context.Details.ToListAsync();
            return Ok(details);
        }

        // GET: api/settings/credentials
        [HttpGet("credentials")]
        public async Task<IActionResult> GetCredentials()
        {
            // Retrieve all stored credentials from the database
            var credentials = await _context.Credentials.ToListAsync();
            return Ok(credentials);
        }

        // POST: api/settings/save
        [HttpPost("save")]
        public async Task<IActionResult> SaveCredentials([FromBody] Detail credential)
        {
            if (credential == null)
            {
                return BadRequest("Credentials cannot be null.");
            }

            // Check for NULL values in the fields
            if (string.IsNullOrEmpty(credential.domain) || string.IsNullOrEmpty(credential.username) || string.IsNullOrEmpty(credential.apiToken))
            {
                return BadRequest("Domain, Username, and ApiToken cannot be empty.");
            }

            try
            {
                // Proceed with saving the credentials
                _context.Details.Add(credential);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Credentials saved successfully." });
            }
            catch (Exception ex)
            {
                // Log exception and return error response
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/settings/delete/{id}
        [HttpDelete("detail/delete/{id}")]
        public async Task<IActionResult> DeleteDetail(int id)
        {
            // Find the credential by its Id in the Details table
            var credential = await _context.Details.FindAsync(id);

            if (credential == null)
            {
                return NotFound(new { message = "Credential not found." });
            }

            // Remove the credential from the Details table
            _context.Details.Remove(credential);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Credential deleted successfully." });
        }

        // DELETE: api/settings/delete/{id}
        [HttpDelete("credential/delete/{id}")]
        public async Task<IActionResult> DeleteCredential(int id)
        {
            // Find the credential by its Id in the Details table
            var credential = await _context.Credentials.FindAsync(id);

            if (credential == null)
            {
                return NotFound(new { message = "Credential not found." });
            }

            // Remove the credential from the Credentials table
            _context.Credentials.Remove(credential);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Credential deleted successfully." });
        }
    }
}