import re

with open("client/src/pages/AqeeqAdminDashboardPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I need to find the `</div>\n              )}\n            </div>\n            {/* Accordion 2` and add one more `</div>`
content = content.replace(
    """</div>
              )}
            </div>
            {/* Accordion 2""",
    """</div>
                </div>
              )}
            </div>
            {/* Accordion 2"""
)

content = content.replace(
    """</div>
              )}
            </div>
            {/* Accordion 3""",
    """</div>
                </div>
              )}
            </div>
            {/* Accordion 3"""
)

content = content.replace(
    """</div>
              )}
            </div>
            {/* Accordion 4""",
    """</div>
                </div>
              )}
            </div>
            {/* Accordion 4"""
)

content = content.replace(
    """</div>
              )}
            </div>
            {/* Bottom Save Bar""",
    """</div>
                </div>
              )}
            </div>
            {/* Bottom Save Bar"""
)

with open("client/src/pages/AqeeqAdminDashboardPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
