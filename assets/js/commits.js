// SPDX-FileCopyrightText: 2022 Union
//
// SPDX-License-Identifier: AGPL-3.0-or-later

fetch("https://api.github.com/orgs/union-platform/repos")
  .then((response) => response.json())
  .then((res) => {
    const reposNames = res.map((v) => ({ name: v.name, url: v.html_url }));

    return Promise.all(
      reposNames.map((project) =>
        fetch(
          `https://api.github.com/repos/union-platform/${project.name}/commits`
        )
          .then((resp) => resp.json())
          .then((res) =>
            res.map((v) => ({ ...v, source: project.name, url: project.url }))
          )
      )
    );
  })
  .then((res) => {
    const allCommits = [].concat.apply([], res);

    const allCommitsSortedByNewest = allCommits.sort(
      (a, b) =>
        new Date(b.commit.committer.date) - new Date(a.commit.committer.date)
    );

    const lastSixCommits = allCommitsSortedByNewest.slice(0, 6);

    for (let currentCommit of lastSixCommits) {
      const el = document.createElement("div");

      el.setAttribute("class", "col-lg-4 col-md-6");

      el.innerHTML = `
      <div class="site-testimonial-item">
        <div class="site-testimonial-item-header">
          <div class="person">
            <a href="${currentCommit.author.html_url}">${currentCommit.author.login}, </a>
            <a href="${currentCommit.url}">${currentCommit.source}</a>
            <p>${JSON.stringify(currentCommit.commit.message).replace(/(")|\\n.*$/g,"")}</p>
            <span class="site-testimonial-date">${new Date(currentCommit.commit.committer.date).getDate()} ${new Date(currentCommit.commit.committer.date).toLocaleString('default', { month: 'long' })}</span>
          </div>
        </div>
      </div>
    ;`
      document.getElementById("commits-row").appendChild(el);
    }
  });
