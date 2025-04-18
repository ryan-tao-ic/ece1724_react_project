import { Container } from "@/components/ui/container";
import { MainLayout } from "@/components/layout/main-layout";

export default function ContactPage() {
  return (
    <MainLayout>
      <Container className="max-w-3xl py-12">
        <div className="mb-10">
          <img
            src="/contactus.png"
            alt="Contact Us"
            width={800}
            height={300}
            className="mx-auto object-contain rounded-lg shadow-md"
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Contact Us</h1>

        <p className="text-lg md:text-xl text-muted-foreground text-center mb-12">
          Have questions about EventHub, need support, or want to provide feedback?
          We’d love to hear from you. Please reach out using the information below.
        </p>

        <div className="space-y-12 text-base md:text-lg">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              General Inquiries & Technical Support
            </h2>
            <ul className="space-y-2">
              {[
                "luke.ren@mail.utoronto.ca",
                "zhaoyi.cheng@mail.utoronto.ca",
                "yige.tao@mail.utoronto.ca",
                "ruoxi.yu@mail.utoronto.ca",
              ].map((email) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <p className="leading-relaxed">
              The Edward S. Rogers Sr. Department of Electrical and Computer Engineering
              <br />
              10 King's College Road, Room SFB600
              <br />
              Toronto, Ontario, Canada
              <br />
              M5S 3G4
            </p>
          </div>

          <p className="text-muted-foreground text-sm md:text-base text-center">
            We typically respond within 1–2 business days.
          </p>
        </div>
      </Container>
    </MainLayout>
  );
}
