namespace J_Test.Models
{
    public class TestCase
    {
        public string TestSteps { get; set; }
        public string Input { get; set; }
        public string ExpectedOutput { get; set; }
        public string ActualOutput { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }
    }

    public class Candidate
    {
        public Content Content { get; set; }
        public string TestSteps { get; set; }
        public string Input { get; set; }
        public string ExpectedOutput { get; set; }
        public string ActualOutput { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }
    }

    public class Content
    {
        public List<Part> Parts { get; set; }
    }

    public class Part
    {
        public string Text { get; set; }
    }

    public class GenerateTestCasesResponse
    {
        public List<Candidate> Candidates { get; set; }
    }

}
