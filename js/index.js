document.addEventListener("DOMContentLoaded", () => {
  // ========== Scroll 처리 부분 시작 ==========
  gsap.registerPlugin(ScrollTrigger);

  const worksContainer = document.querySelector(".works");
  const works = document.querySelectorAll(".work");

  const worksWidth = [...works].reduce(
    (acc, cur) => (acc += cur.offsetWidth),
    0
  );
  const workWidth = worksWidth / works.length;

  gsap.to(worksContainer, {
    x: () => -(worksWidth - (window.innerWidth - workWidth)),
    ease: "none",
    scrollTrigger: {
      trigger: "section#works",
      pin: true,
      scrub: true,
      start: "top top",
      end: () => worksWidth - (window.innerWidth - workWidth),
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });
  // ========== Scroll 처리 부분 끝 ==========

  // ========== Pagination 처리 부분 시작 ==========
  const container = document.querySelector(".container");
  const sections = document.querySelectorAll("main section");
  const pagination = document.querySelector(".pagination ul");

  sections.forEach((section, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    pagination.appendChild(li);
  });

  const paginationItems = document.querySelectorAll(".pagination li");
  // const filterColors = ['white', 'black', 'orange', 'red']

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = [...sections].indexOf(entry.target);

        if (entry.isIntersecting) {
          console.log(index);
          container.style.backgroundImage = `url('./images/background${index}.png')`;
          // container.style.backgroundColor = filterColors[index];
          paginationItems.forEach((item) => item.classList.remove("active"));
          if (paginationItems[index]) {
            paginationItems[index].classList.add("active");
          }
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  sections.forEach((section) => observer.observe(section));

  paginationItems.forEach((li, index) => {
    li.addEventListener("click", () => {
      sections[index].scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
// ========== Pagination 처리 부분 끝 ==========
