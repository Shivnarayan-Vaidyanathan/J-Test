using Microsoft.EntityFrameworkCore;

namespace J_Test.Models
{
    public partial class JTestCredentialsContext : DbContext
    {
        public JTestCredentialsContext(DbContextOptions<JTestCredentialsContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Credential> Credentials { get; set; }
        public virtual DbSet<Detail> Details { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Credential Entity
            modelBuilder.Entity<Credential>(entity =>
            {
                entity.HasKey(e => e.id);  // Use Id as the primary key

                entity.Property(e => e.email)
                    .HasMaxLength(254)
                    .IsUnicode(false);
                entity.Property(e => e.password)
                    .HasMaxLength(254)
                    .IsUnicode(false);
            });

            //Configure Detail Entity
            modelBuilder.Entity<Detail>(entity =>
            {
                entity.HasKey(e => e.Id);  // Use Id as the primary key

                entity.Property(e => e.domain)
                    .HasMaxLength(254)
                    .IsUnicode(false);
                entity.Property(e => e.username)
                    .HasMaxLength(254)
                    .IsUnicode(false);
                entity.Property(e => e.apiToken)
                    .HasMaxLength(254)
                    .IsUnicode(false);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}