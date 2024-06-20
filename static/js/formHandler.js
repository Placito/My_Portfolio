// static/formHandler.js
export function initFormHandler() {
    $(document).ready(function() {
        $('#contact-form').on('submit', function(event) {
            event.preventDefault();

            $.ajax({
                type: 'POST',
                url: '/send',
                data: $(this).serialize(),
                success: function(response) {
                    let alertContainer = $('#alert-container');
                    let alertMessage = `
                    <div class="alert alert-${response.status === 'success' ? 'success' : 'danger'} alert-dismissible fade show" role="alert">
                        ${response.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                    `;
                    alertContainer.html(alertMessage);
                    if (response.status === 'success') {
                        $('#contact-form')[0].reset();
                    }
                },
                error: function() {
                    let alertContainer = $('#alert-container');
                    let alertMessage = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        An error occurred. Please try again.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                    `;
                    alertContainer.html(alertMessage);
                }
            });
        });
    });
}
