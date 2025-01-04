namespace J_Test.Models
{
    public class Credential
    {
        public int id { get; set; }  // Primary Key
        public string email { get; set; }
        public string password { get; set; }
    }

    public class Detail
    {
        public int Id { get; set; }  // Primary Key
        public string domain { get; set; }
        public string username { get; set; }
        public string apiToken { get; set; }
    }
}