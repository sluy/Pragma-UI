/**
 * Pragma.Libs.Equalize
 * Plugin para equalizar los tamaños de elementos.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-equalize : define el elemento padre de la equalización
 * data-pragma-equalize-options="[opciones]"     :   Opciones de configuración del menú desplegable via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Equalize.change()    : Iguala la altura de todos los elementos con respecto al que mayor valor tenga.
 * Navbar.restore()     : Reestablece la altura de los elementos ecualizados.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.navbar.before_init  : Lanzado al inicializar el plugin.
 * pragma.navbar.after_init   : Lanzado al terminar la configuración inicial del plugin.
 * pragma.navbar.changed      : Evento disparado al ecualizar los elementos.
 * pragma.navbar.restored     : Evento disparado al reestablecer los elementos.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Equalize = function (element, options)
	{
		var self = this;
		self.options = options;
		self.$el = element;
		/**
		* Método privado.
		* Determina si debe ignorarse o no la ecualización en el dispositivo actual
		*/
		function ignore()
		{
			var device = Pragma.Utils.get_device();
			var ignore = self.options.ignore.toString().toLowerCase();
			switch (device)
			{
				case "xs":
					return (ignore == "xs" || ignore == "sm-down" || ignore == "md-down");
					break;
				case "sm":
					return (ignore == "sm" || ignore == "sm-up" || ignore == "sm-down" || ignore == "md-down");
					break;
				case "md":
					return (ignore == "md" || ignore == "sm-up" || ignore == "md-up" || ignore == "md-down");
					break;
				case "lg":
					return (ignore == "lg" || ignore == "sm-up" || ignore == "md-up");
					break;
			}
			return false;
		}
		/**
		* Método privado.
		* Devuelve la altura máxima de los elementos.
		*/
		function get_max_height()
		{
			var height = 0;

			if (Pragma.Utils.count_object(self.childs) > 0)
			{
				$.each(self.childs, function (k, child)
				{
					if (parseInt(child.$el.outerHeight()) > height)
					{
						height = child.$el.outerHeight();
					}
				});
			}
			return height;
		}
		/**
		* Método privado.
		* Carga los elementos
		*/
		function load_childs()
		{
			self.childs = {};
			var selector = " > *";
			if (typeof self.options.selector == "string" && self.options.selector.length > 0)
			{
				selector += " " + self.options.selector;
			}

			self.$el.find(selector).each(function (k)
			{
				if ($(this).is(":visible"))
				{
					self.childs[k] =
					{
						$el: $(this),
						height: $(this)[0].style.height
					}
				}
			});
		}
		/**
		* Configura el plugin al iniciar.
		*/
		function configure()
		{
			self.equalized = false;//Variable que determina si los elementos han sido ecualizados
			self.$el.trigger("pragma.equalize.before_init");
			//Agrega la ecualización al redimensionar la página
			$(window).resize(function ()
			{
				self.restore();
				self.change();
			});
			//Inicia la ecualización si autostart está en true
			if (self.options.autostart)
			{
				self.change();
			}
			self.$el.trigger("pragma.equalize.after_init");
		}

		/**
		* Cambia la altura de los elementos a la del elemento con mayor altura.
		*/
		self.change = function ()
		{
			if (ignore())
			{
				return;
			}
			load_childs();
			var height = get_max_height();

			if (height > 0)
			{
				$.each(self.childs, function (k, child)
				{
					child.$el.css("height", height);
				});
				self.equalized = true;
				self.$el.trigger("pragma.equalize.changed");
			}
		}
		/**
		* Restaura el tamaño de los elementos.
		*/
		self.restore = function ()
		{
			if (self.equalized)
			{
				$.each(self.childs, function (k, child)
				{
					child.$el.css("height", child.height);
				});
				self.childs = {};
				self.equalized = false;
				self.$el.trigger("pragma.equalize.restored");
			}
		}
		configure();
	}

	//Versión del plugin
	Pragma.Libs.Equalize.Ver = "1.0.0";
	/**Opciones del plugin 'equalize'**/
	Pragma.Libs.Equalize.Defaults =
	{
		selector: "", //Selector para definir los elementos a ecualizar
		autostart: true, //Determina si debe iniciar la ecualización al iniciar el plugin
		ignore: false //Define en que dispositivos ignorar : xs/sm/md/lg/[dispositivo]-[up/down]
	}

	/**
	* Inicializamos el plugin para las barras de navegación existentes
	* al cargar el script.
	*/
	$(function ()
	{
		$("[data-pragma-equalize]").each(function (e)
		{
			$(this).pragma("equalize");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));